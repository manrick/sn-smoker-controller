/* global GlideRecord, SmokerRelayControl, request, response */

(function process(request, response) {
    var body = request.body.dataString || '{}';
    var payload = JSON.parse(body);
    var deviceId = String(payload.deviceId || '');
    var action = String(payload.action || '');
    var device = new GlideRecord('x_tsigh_smkrctrl_smoker_device');

    if (!deviceId || (action !== 'on' && action !== 'off')) {
        response.setStatus(400);
        response.setBody({success: false, message: 'A deviceId and action of on or off are required'});
        return;
    }
    if (!device.get(deviceId)) {
        response.setStatus(404);
        response.setBody({success: false, message: 'Smoker device not found'});
        return;
    }

    var result = new SmokerRelayControl().setRelay(deviceId, action === 'on', payload.sessionId || '');
    response.setStatus(result.success ? 200 : 409);
    response.setBody(result);
})(request, response);