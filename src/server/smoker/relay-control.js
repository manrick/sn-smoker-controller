/* global Class, GlideDateTime, GlideRecord, sn_ws */

var SmokerRelayControl = Class.create();
SmokerRelayControl.prototype = {
    initialize: function() {},

    setRelay: function(deviceId, relayOn, sessionId, source, reason, allowOfflineShutdown) {
        var device = new GlideRecord('x_tsigh_smkrctrl_smoker_device');
        if (!device.get(deviceId)) {
            return {success: false, message: 'Smoker device not found'};
        }

        var action = new GlideRecord('x_tsigh_smkrctrl_control_action');
        action.initialize();
        action.setValue('smoker_device', deviceId);
        if (sessionId) {
            action.setValue('cooking_session', sessionId);
        }
        var desiredAction = relayOn ? 'relay_on' : 'relay_off';
        action.setValue('action', desiredAction);
        action.setValue('source', source || 'manual_user');
        action.setValue('result', 'requested');
        action.setValue('requested_at', new GlideDateTime());
        action.setValue('reason', reason || 'Manual relay control request');

        var safetyShutdown = source === 'safety_logic' && !relayOn;
        if (sessionId && !safetyShutdown) {
            var session = new GlideRecord('x_tsigh_smkrctrl_cooking_session');
            if (session.get(sessionId)) {
                var minimumDelaySeconds = parseInt(session.getValue('minimum_relay_switch_interval_seconds'), 10) || 0;
                if (minimumDelaySeconds > 0) {
                    var latestSwitch = new GlideRecord('x_tsigh_smkrctrl_control_action');
                    latestSwitch.addQuery('cooking_session', sessionId);
                    latestSwitch.addQuery('action', 'IN', 'relay_on,relay_off');
                    latestSwitch.orderByDesc('requested_at');
                    latestSwitch.setLimit(1);
                    latestSwitch.query();
                    if (latestSwitch.next()) {
                        var lastAction = latestSwitch.getValue('action');
                        var lastRequestedAt = latestSwitch.getValue('requested_at');
                        if (lastAction !== desiredAction && lastRequestedAt) {
                            var lastRequestTime = new GlideDateTime(lastRequestedAt).getNumericValue();
                            var now = new GlideDateTime().getNumericValue();
                            if ((now - lastRequestTime) < (minimumDelaySeconds * 1000)) {
                                return this._finish(action, 'blocked', 'Minimum relay switch interval has not elapsed yet');
                            }
                        }
                    }
                }
            }
        }

        if (device.getValue('active') !== '1') {
            return this._finish(action, 'blocked', 'Device is inactive');
        }
        if (device.getValue('connection_status') !== 'online' && !(allowOfflineShutdown && !relayOn)) {
            return this._finish(action, 'blocked', 'Device is not online');
        }

        var operation = relayOn ? 'relayOn' : 'relayOff';
        var request = new sn_ws.RESTMessageV2('Smoker Controller API', operation);
        request.setStringParameterNoEscape('baseUrl', device.getValue('api_base_url'));
        var apiKey = String(device.getElement('api_key').getDecryptedValue() || '').trim();
        if (!apiKey || /^[*\u2022]+$/.test(apiKey)) {
            return this._finish(action, 'blocked', 'API key is empty or masked; re-enter it on the Smoker Device record');
        }
        request.setRequestHeader('X-API-Key', apiKey);
        request.setHttpTimeout((parseInt(device.getValue('request_timeout_seconds'), 10) || 5) * 1000);

        try {
            var response = request.execute();
            var httpStatus = response.getStatusCode();
            var payload = JSON.parse(response.getBody());
            var expectedState = relayOn;
            if (httpStatus !== 200 || payload.relay_active !== expectedState || payload.status !== 'success') {
                action.setValue('response_http_status', httpStatus);
                return this._finish(action, 'failed', 'Relay response did not confirm the requested state');
            }
            action.setValue('response_http_status', httpStatus);
            device.setValue('last_relay_state', relayOn ? 'on' : 'off');
            device.update();
            return this._finish(action, 'succeeded', 'Relay state confirmed');
        } catch (error) {
            return this._finish(action, 'failed', error.message || String(error));
        }
    },

    _finish: function(action, result, message) {
        action.setValue('result', result);
        action.setValue('response_message', message);
        action.insert();
        return {success: result === 'succeeded', result: result, message: message};
    },

    type: 'SmokerRelayControl'
};