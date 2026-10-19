/* global GlideRecord, request, response */

(function process(request, response) {
    var body;
    try {
        body = JSON.parse(request.body.dataString || '{}');
    } catch (error) {
        response.setStatus(400);
        response.setBody({success: false, message: 'Request body must contain valid JSON'});
        return;
    }

    var deviceId = String(body.deviceId || '');
    if (!deviceId) {
        response.setStatus(400);
        response.setBody({success: false, message: 'A deviceId is required'});
        return;
    }

    var device = new GlideRecord('x_tsigh_smkrctrl_smoker_device');
    if (!device.get(deviceId)) {
        response.setStatus(404);
        response.setBody({success: false, message: 'Smoker device not found'});
        return;
    }

    var activeSession = new GlideRecord('x_tsigh_smkrctrl_cooking_session');
    activeSession.addQuery('smoker_device', deviceId);
    activeSession.addQuery('status', 'IN', 'planned,preheating,cooking,holding');
    activeSession.setLimit(1);
    activeSession.query();
    if (activeSession.next()) {
        response.setStatus(409);
        response.setBody({success: false, message: 'Stop the active cooking session before clearing history'});
        return;
    }

    var tables = [
        'x_tsigh_smkrctrl_temperature_reading',
        'x_tsigh_smkrctrl_control_action',
        'x_tsigh_smkrctrl_device_alert',
    ];
    var deleted = {};
    for (var index = 0; index < tables.length; index += 1) {
        var records = new GlideRecord(tables[index]);
        records.addQuery('smoker_device', deviceId);
        records.query();
        deleted[tables[index]] = 0;
        while (records.next()) {
            records.deleteRecord();
            deleted[tables[index]] += 1;
        }
    }

    response.setStatus(200);
    response.setBody({success: true, deleted: deleted});
})(request, response);
