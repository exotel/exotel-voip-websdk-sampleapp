/**
 * Captures console output + demo event log + SDK localStorage logs for manual call testing.
 */
(function () {
    const MAX_CONSOLE_LINES = 20000;
    const SDK_LOG_KEY = 'webrtc_sdk_logs';

    const capture = {
        pageStartedAt: new Date().toISOString(),
        sessions: [],
        currentSession: null,
        consoleLines: [],
        manualActions: [],
    };

    function formatArg(arg) {
        if (arg == null) return String(arg);
        if (arg instanceof Error) return arg.stack || arg.message;
        if (typeof arg === 'object') {
            try {
                return JSON.stringify(arg);
            } catch (e) {
                return String(arg);
            }
        }
        return String(arg);
    }

    function formatConsoleArgs(args) {
        return Array.from(args).map(formatArg).join(' ');
    }

    function pushConsole(level, args) {
        const line = `[${new Date().toISOString()}] [CONSOLE.${level}] ${formatConsoleArgs(args)}`;
        capture.consoleLines.push(line);
        if (capture.consoleLines.length > MAX_CONSOLE_LINES) {
            capture.consoleLines.splice(0, capture.consoleLines.length - MAX_CONSOLE_LINES);
        }
    }

    ['log', 'warn', 'error', 'info', 'debug'].forEach((level) => {
        const original = console[level] ? console[level].bind(console) : console.log.bind(console);
        console[level] = function (...args) {
            pushConsole(level, args);
            original(...args);
        };
    });

    function markManual(action, detail) {
        const entry = {
            at: new Date().toISOString(),
            action,
            detail: detail || '',
            callId: capture.currentSession ? capture.currentSession.id : null,
        };
        capture.manualActions.push(entry);
        const line = `[MANUAL] ${action}${detail ? ': ' + detail : ''}`;
        if (typeof window.appendEventLog === 'function') {
            window.appendEventLog(line);
        } else {
            pushConsole('log', [line]);
        }
    }

    function beginCallSession(trigger) {
        if (capture.currentSession && !capture.currentSession.endedAt) {
            endCallSession('superseded_by_' + trigger);
        }
        const id = 'call-' + Date.now();
        capture.currentSession = {
            id,
            startedAt: new Date().toISOString(),
            trigger,
            endedAt: null,
            endReason: null,
        };
        capture.sessions.push(capture.currentSession);
        markManual('call_session_start', id + ' (' + trigger + ')');
    }

    function endCallSession(reason) {
        if (!capture.currentSession || capture.currentSession.endedAt) return;
        capture.currentSession.endedAt = new Date().toISOString();
        capture.currentSession.endReason = reason || 'unknown';
        markManual('call_session_end', capture.currentSession.id + ' (' + reason + ')');
        capture.currentSession = null;
    }

    function onCallEvent(eventType) {
        const t = String(eventType || '').toLowerCase();
        if (t === 'incoming' || t === 'ringing') {
            if (!capture.currentSession) beginCallSession(t);
        } else if (t === 'connected') {
            if (!capture.currentSession) beginCallSession('connected');
            else markManual('call_connected', capture.currentSession.id);
        } else if (t === 'callended' || t === 'ended' || t === 'disconnected' || t === 'terminated') {
            endCallSession(t);
        }
    }

    function getEventLogText() {
        const ta = document.getElementById('eventLog');
        return ta ? ta.value : '';
    }

    function getDiagnosticsLogText() {
        const ta = document.getElementById('diagnosticsLog');
        return ta ? ta.value : '';
    }

    function getSdkStorageLogs() {
        try {
            return JSON.parse(localStorage.getItem(SDK_LOG_KEY) || '[]');
        } catch (e) {
            return ['[capture] Failed to read SDK logs from localStorage: ' + e.message];
        }
    }

    function buildFullLogText() {
        const lines = [];
        lines.push('=== Manual Call Test — Full Capture ===');
        lines.push('Generated: ' + new Date().toISOString());
        lines.push('Page started: ' + capture.pageStartedAt);
        lines.push('Browser: ' + navigator.userAgent);
        lines.push('URL: ' + location.href);
        lines.push('');

        lines.push('=== Call sessions ===');
        if (!capture.sessions.length) {
            lines.push('(none)');
        } else {
            capture.sessions.forEach((s) => {
                lines.push(
                    s.id +
                        ' | start=' + s.startedAt +
                        ' | trigger=' + s.trigger +
                        ' | end=' + (s.endedAt || 'active') +
                        ' | reason=' + (s.endReason || '-')
                );
            });
        }
        lines.push('');

        lines.push('=== Manual UI actions ===');
        if (!capture.manualActions.length) {
            lines.push('(none — use Hold, Mute, DTMF buttons during a call)');
        } else {
            capture.manualActions.forEach((a) => {
                lines.push('[' + a.at + '] ' + a.action + (a.detail ? ' | ' + a.detail : '') + (a.callId ? ' | ' + a.callId : ''));
            });
        }
        lines.push('');

        lines.push('=== Live event log (demo callbacks) ===');
        lines.push(getEventLogText() || '(empty)');
        lines.push('');

        if (getDiagnosticsLogText()) {
            lines.push('=== Diagnostics log ===');
            lines.push(getDiagnosticsLogText());
            lines.push('');
        }

        lines.push('=== Console capture (log/warn/error/info/debug) ===');
        lines.push(capture.consoleLines.join('\n') || '(empty)');
        lines.push('');

        lines.push('=== SDK internal logs (localStorage webrtc_sdk_logs) ===');
        lines.push(getSdkStorageLogs().join('\n') || '(empty)');
        lines.push('');
        lines.push('=== End of capture ===');

        return lines.join('\n');
    }

    function downloadTextFile(filename, text) {
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    window.callLogCapture = {
        markManual,
        onCallEvent,
        beginCallSession,
        endCallSession,
        getStats() {
            return {
                consoleLines: capture.consoleLines.length,
                sessions: capture.sessions.length,
                manualActions: capture.manualActions.length,
                activeCall: capture.currentSession ? capture.currentSession.id : null,
            };
        },
        clearCapture() {
            capture.consoleLines = [];
            capture.manualActions = [];
            capture.sessions = [];
            capture.currentSession = null;
            capture.pageStartedAt = new Date().toISOString();
            const ta = document.getElementById('eventLog');
            if (ta) ta.value = '';
            const diag = document.getElementById('diagnosticsLog');
            if (diag) diag.value = '';
            try {
                localStorage.setItem(SDK_LOG_KEY, JSON.stringify([]));
            } catch (e) { /* ignore */ }
            markManual('capture_cleared', 'ready for new manual test');
            updateCaptureStatus();
        },
        downloadFullCapture() {
            const now = new Date();
            const date = now.toISOString().split('T')[0];
            const time = now.toISOString().split('T')[1].replace(/[:.]/g, '-').slice(0, 8);
            downloadTextFile('manual_call_test_' + date + '_' + time + '.txt', buildFullLogText());
            markManual('download_full_capture', callLogCapture.getStats().consoleLines + ' console lines');
        },
    };

    function updateCaptureStatus() {
        const el = document.getElementById('captureStatus');
        if (!el) return;
        const s = window.callLogCapture.getStats();
        el.textContent =
            'Recording: console + events + SDK logs | ' +
            s.consoleLines + ' console lines | ' +
            s.manualActions + ' manual actions | ' +
            (s.activeCall ? 'active ' + s.activeCall : 'no active call session');
    }

    window.updateCaptureStatus = updateCaptureStatus;
    setInterval(updateCaptureStatus, 2000);

    window.addEventListener('load', () => {
        markManual('capture_ready', 'Test manually: Hold, Mute, DTMF, network blip — then Download Full Capture');
        updateCaptureStatus();
    });
})();
