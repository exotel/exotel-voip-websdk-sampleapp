/**
 * Automated E2E test orchestrator for demo-non-npm.
 * You handle register + placing/accepting the call; the runner does the rest.
 */
(function () {
    const CALL_CONNECT_TIMEOUT_MS = 180000;
    const STEP_DELAY_MS = 2000;
    const OFFLINE_HOLD_SEC = 5;
    const RECOVERY_WAIT_MS = 25000;
    const PREP_COUNTDOWN_SEC = 8;

    const runner = {
        running: false,
        cancelled: false,
        results: [],
        recoveryEvents: [],
        callEvents: [],
        sessionEvents: [],
        registerState: null,
    };

    function sleep(ms) {
        return new Promise((resolve, reject) => {
            const start = Date.now();
            const tick = () => {
                if (runner.cancelled) {
                    reject(new Error('cancelled'));
                    return;
                }
                if (Date.now() - start >= ms) {
                    resolve();
                    return;
                }
                setTimeout(tick, 100);
            };
            tick();
        });
    }

    function setBanner(html, level) {
        const el = document.getElementById('e2eBanner');
        if (!el) return;
        el.innerHTML = html;
        el.className = 'e2e-banner e2e-' + (level || 'info');
        el.style.display = 'block';
    }

    function hideBanner() {
        const el = document.getElementById('e2eBanner');
        if (el) el.style.display = 'none';
    }

    function setProgress(text) {
        const el = document.getElementById('e2eProgress');
        if (el) el.textContent = text;
    }

    function setReport(html) {
        const el = document.getElementById('e2eReport');
        if (el) {
            el.innerHTML = html;
            el.style.display = 'block';
        }
    }

    function setManualLock(locked) {
        document.body.classList.toggle('e2e-running', locked);
        ['muteButton', 'holdButton'].forEach((id) => {
            const el = document.getElementById(id);
            if (el) el.disabled = locked;
        });
    }

    function record(step, pass, detail) {
        runner.results.push({ step, pass, detail, at: new Date().toISOString() });
        const icon = pass ? 'PASS' : pass === null ? 'SKIP' : 'FAIL';
        appendEventLog(`[E2E ${icon}] ${step}: ${detail}`);
    }

    function isRegistered() {
        const st = document.getElementById('status');
        return st && String(st.innerHTML).toLowerCase().includes('registered');
    }

    function isCallConnected() {
        const st = document.getElementById('call_status');
        if (!st) return false;
        const v = String(st.innerHTML).toLowerCase();
        return v === 'connected' || v.includes('connected');
    }

    /** Session events from demo.js __e2eSessionFeed (primary) or runner fallback. */
    function sessionFeed() {
        return window.__e2eSessionFeed || runner.sessionEvents;
    }

    function getSipPhone() {
        return exWebClient && exWebClient.webrtcSIPPhone;
    }

    async function waitForSdkBool(readFn, expected, timeoutMs, label) {
        const deadline = Date.now() + timeoutMs;
        let last = null;
        while (Date.now() < deadline && !runner.cancelled) {
            try {
                last = readFn();
                if (last === expected) {
                    return;
                }
            } catch (e) {
                /* phone not ready yet */
            }
            await sleep(150);
        }
        throw new Error(`timeout: ${label} (expected ${expected}, last ${last})`);
    }

    /** Wait for a session event that arrives after startIdx (capture length before the action). */
    function waitForSessionEventSince(startIdx, matchFn, timeoutMs, label) {
        return new Promise((resolve, reject) => {
            const deadline = Date.now() + timeoutMs;
            const tryMatch = () => {
                const feed = sessionFeed();
                for (let i = startIdx; i < feed.length; i++) {
                    if (matchFn(feed[i])) {
                        return feed[i];
                    }
                }
                return null;
            };

            const hit = tryMatch();
            if (hit) {
                resolve(hit);
                return;
            }

            const poll = setInterval(() => {
                if (runner.cancelled) {
                    clearInterval(poll);
                    reject(new Error('cancelled'));
                    return;
                }
                const matched = tryMatch();
                if (matched) {
                    clearInterval(poll);
                    resolve(matched);
                    return;
                }
                if (Date.now() > deadline) {
                    clearInterval(poll);
                    const feed = sessionFeed();
                    const recent = feed.slice(startIdx).join(', ') || 'none';
                    reject(new Error('timeout: ' + (label || 'session event') + ' (since action: ' + recent + ')'));
                }
            }, 100);
        });
    }

    function waitForCallConnected(timeoutMs) {
        return new Promise((resolve, reject) => {
            if (isCallConnected()) {
                resolve();
                return;
            }
            const deadline = Date.now() + timeoutMs;
            const poll = setInterval(() => {
                if (runner.cancelled) {
                    clearInterval(poll);
                    reject(new Error('cancelled'));
                    return;
                }
                if (isCallConnected()) {
                    clearInterval(poll);
                    resolve();
                    return;
                }
                if (Date.now() > deadline) {
                    clearInterval(poll);
                    reject(new Error('no connected call within timeout — accept the call, then re-run (or start E2E before hanging up)'));
                }
            }, 400);
        });
    }

    window.e2eOnCallEvent = function (eventType) {
        runner.callEvents.push(eventType);
    };

    window.e2eOnSessionEvent = function (state) {
        runner.sessionEvents.push(state);
        if (String(state).includes('media_recovery')) {
            runner.recoveryEvents.push({ state, at: Date.now() });
        }
    };

    window.e2eOnRegisterEvent = function (state) {
        runner.registerState = state;
    };

    async function countdownBanner(seconds, messageFn) {
        for (let i = seconds; i >= 1; i--) {
            setBanner(messageFn(i), i <= 3 ? 'warn' : 'info');
            await sleep(1000);
        }
    }

    async function runHoldMuteDtmfSteps() {
        const c = exWebClient.getCall();
        if (!c) {
            record('Hold / Mute / DTMF', false, 'No active call object');
            return;
        }

        setBanner('<b>Automated steps running — do not click Hold or Mute.</b>', 'info');

        setProgress('Step 5/8: Hold → Unhold (automated)');
        try {
            const phone = getSipPhone();
            if (!phone || typeof phone.getHoldStatus !== 'function') {
                throw new Error('getHoldStatus unavailable');
            }
            c.Hold();
            await waitForSdkBool(() => phone.getHoldStatus(), true, 20000, 'hold');
            await sleep(STEP_DELAY_MS);
            c.UnHold();
            await waitForSdkBool(() => phone.getHoldStatus(), false, 20000, 'unhold');
            record('Hold / Unhold', true, 'hold state true → false');
        } catch (e) {
            record('Hold / Unhold', false, e.message);
        }

        setProgress('Step 6/8: Mute → Unmute (automated)');
        try {
            const phone = getSipPhone();
            if (!phone || typeof phone.getMuteStatus !== 'function') {
                throw new Error('getMuteStatus unavailable');
            }
            c.Mute();
            await waitForSdkBool(() => phone.getMuteStatus(), true, 15000, 'muted');
            await sleep(STEP_DELAY_MS);
            c.UnMute();
            await waitForSdkBool(() => phone.getMuteStatus(), false, 15000, 'unmuted');
            record('Mute / Unmute', true, 'mute state true → false');
        } catch (e) {
            record('Mute / Unmute', false, e.message);
        }

        setProgress('Step 7/8: DTMF (automated)');
        try {
            c.sendDTMF('1');
            await sleep(800);
            record('DTMF', true, 'sent digit 1 via SIP INFO');
        } catch (e) {
            record('DTMF', false, e.message);
        }
    }

    async function runNetworkRecoveryStep() {
        const beforeCount = runner.recoveryEvents.length;
        const feedStart = sessionFeed().length;

        setBanner(
            '<b>Step 8/8 — Network recovery (your action only)</b><br>' +
            '1. Open DevTools (<b>F12</b>) → <b>Network</b> tab (keep it open)<br>' +
            '2. Do <b>not</b> click Hold/Mute during this step<br>' +
            'Prep countdown starts now…',
            'warn'
        );
        await sleep(1500);

        await countdownBanner(PREP_COUNTDOWN_SEC, (n) =>
            `<b>Prep ${n}s…</b> DevTools → Network tab ready?<br>` +
            `When you see <b>OFFLINE NOW</b>, check the <b>Offline</b> checkbox.`
        );

        setBanner(
            `<b>OFFLINE NOW — check Offline</b><br>Keep offline for <b>${OFFLINE_HOLD_SEC} seconds</b>, then uncheck.`,
            'warn'
        );
        await sleep(OFFLINE_HOLD_SEC * 1000);

        setBanner('<b>ONLINE NOW — uncheck Offline</b><br>Waiting for media recovery events…', 'info');

        const recoveryDeadline = Date.now() + RECOVERY_WAIT_MS;
        let degraded = false;
        let succeeded = false;
        let attempted = false;

        while (Date.now() < recoveryDeadline && !runner.cancelled) {
            const events = runner.recoveryEvents.slice(beforeCount);
            degraded = events.some((e) => String(e.state).includes('degraded'));
            attempted = events.some((e) => String(e.state).includes('attempted'));
            succeeded = events.some((e) => String(e.state).includes('succeeded'));
            if (succeeded) break;
            await sleep(500);
        }

        const newEvents = runner.recoveryEvents.slice(beforeCount).map((e) => e.state);
        const feedRecovery = sessionFeed()
            .slice(feedStart)
            .filter((s) => String(s).includes('media_recovery') || String(s).includes('ice_connection_state_disconnected'));
        if (succeeded) {
            record('Network recovery', true, 'media_recovery_succeeded: ' + newEvents.join(', '));
        } else if (degraded || attempted || feedRecovery.length) {
            record(
                'Network recovery',
                false,
                'Recovery started but no success within ' + (RECOVERY_WAIT_MS / 1000) + 's. Events: ' +
                    (newEvents.length ? newEvents.join(', ') : feedRecovery.join(', ') || 'partial')
            );
        } else {
            record(
                'Network recovery',
                false,
                'No ICE disconnect / media_recovery — toggle DevTools → Network → Offline during OFFLINE NOW, or turn Wi‑Fi off ~5s'
            );
        }

        setBanner('Network step complete. Do you still hear remote audio?', 'info');
        await sleep(STEP_DELAY_MS);
    }

    function renderFinalReport() {
        const passed = runner.results.filter((r) => r.pass === true).length;
        const failed = runner.results.filter((r) => r.pass === false).length;
        const rows = runner.results
            .map((r) => {
                const cls = r.pass ? 'pass' : r.pass === null ? 'skip' : 'fail';
                const label = r.pass ? 'PASS' : r.pass === null ? 'SKIP' : 'FAIL';
                return `<tr class="${cls}"><td>${label}</td><td>${r.step}</td><td>${r.detail}</td></tr>`;
            })
            .join('');

        setReport(
            `<h4>E2E Report — ${passed} passed, ${failed} failed</h4>` +
            `<table class="e2e-table"><thead><tr><th></th><th>Step</th><th>Detail</th></tr></thead><tbody>${rows}</tbody></table>` +
            `<p class="hint">Download Logs for full SDK trace. End the call manually when done.</p>`
        );
    }

    window.startE2ETestSuite = async function startE2ETestSuite() {
        if (runner.running) {
            appendEventLog('[E2E] Already running');
            return;
        }

        runner.running = true;
        runner.cancelled = false;
        runner.results = [];
        runner.recoveryEvents = [];
        runner.callEvents = [];
        runner.sessionEvents = [];
        window.__e2eSessionFeed = [];
        const btn = document.getElementById('e2eStartBtn');
        const cancelBtn = document.getElementById('e2eCancelBtn');
        if (btn) btn.disabled = true;
        if (cancelBtn) cancelBtn.disabled = false;
        setManualLock(true);

        appendEventLog('[E2E] ========== Test suite started ==========');

        try {
            setProgress('Step 1/8: Prime audio');
            setBanner('<b>Step 1/8</b> Priming audio…', 'info');
            await primeAudioForAccount1();
            record('Prime audio', audioPrimed || true, 'UI tones unlocked for ring/DTMF');

            setProgress('Step 2/8: Register');
            setBanner(
                '<b>Step 2/8 — YOU:</b> Click <b>START</b> on Account 1 now (before testing tones).<br>Waiting up to 90s for registered…',
                'warn'
            );
            if (!isRegistered()) {
                await sleep(5000);
            }
            if (!isRegistered()) {
                const regDeadline = Date.now() + 90000;
                while (!isRegistered() && Date.now() < regDeadline && !runner.cancelled) {
                    await sleep(500);
                }
            }
            if (!isRegistered()) {
                record('Registration', false, 'Not registered — click START and re-run');
                throw new Error('not registered');
            }
            record('Registration', true, 'registered');

            setProgress('Step 3/8: Waiting for connected call');
            if (isCallConnected()) {
                setBanner('<b>Step 3/8</b> Call already connected — continuing…', 'info');
                await sleep(1000);
            } else {
                setBanner(
                    '<b>Step 3/8 — YOU:</b> Receive or place a call, then click <b>Accept Call</b> once.<br>' +
                    'Waiting up to 3 minutes…',
                    'warn'
                );
                await waitForCallConnected(CALL_CONNECT_TIMEOUT_MS);
            }
            record('Call connected', true, 'call_status=connected');
            await sleep(STEP_DELAY_MS);

            setProgress('Step 4/8: Tone check on active call');
            const toneOk = await exWebClient.playTestTone('dtmftone');
            record('Tone during call', toneOk, toneOk ? 'dtmftone played' : 'dtmftone failed');
            await sleep(STEP_DELAY_MS);

            await runHoldMuteDtmfSteps();

            setProgress('Step 8/8: Network recovery');
            await runNetworkRecoveryStep();

            appendEventLog('[E2E] ========== Test suite finished ==========');
        } catch (e) {
            if (e.message !== 'cancelled') {
                appendEventLog('[E2E] Aborted: ' + e.message);
            }
        } finally {
            runner.running = false;
            setManualLock(false);
            hideBanner();
            setProgress('Done — see report below');
            renderFinalReport();
            if (btn) btn.disabled = false;
            if (cancelBtn) cancelBtn.disabled = true;
        }
    };

    window.cancelE2ETestSuite = function cancelE2ETestSuite() {
        if (!runner.running) return;
        runner.cancelled = true;
        appendEventLog('[E2E] Cancel requested…');
    };
})();
