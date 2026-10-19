/* global GlideRecord, request, response */

(function process(request, response) {
    var body = request.body.dataString || '{}';
    var payload = JSON.parse(body);
    var deviceId = String(payload.deviceId || '');
    var enabled = payload.enabled === true;
    var device = new GlideRecord('x_tsigh_smkrctrl_smoker_device');

    if (!deviceId) {
        response.setStatus(400);
        response.setBody({success: false, message: 'A deviceId is required'});
        return;
    }
    if (!device.get(deviceId)) {
        response.setStatus(404);
        response.setBody({success: false, message: 'Smoker device not found'});
        return;
    }
    if (device.getValue('active') !== '1' && enabled) {
        response.setStatus(409);
        response.setBody({success: false, message: 'Activate the device before starting polling'});
        return;
    }

    device.setValue('polling_enabled', enabled);
    device.update();
    response.setStatus(200);
    response.setBody({success: true, polling_enabled: enabled});
})(request, response);