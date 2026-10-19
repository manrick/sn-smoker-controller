import { Record } from '@servicenow/sdk/core'

Record({
    $id: Now.ID['854ccdbd3b57871064e7ecac73e45a70'],
    table: 'sys_hub_action_type_definition',
    data: {
        access: 'public',
        active: 'true',
        attributes: '{labelCacheCleanUpExecuted=true}',
        authored_on_release_version: '29000',
        callable_by_client_api: 'false',
        ih_action: 'true',
        internal_name: 'generate_external_cooking_plan',
        label_cache:
            '[{"name":"{{action.model}}","label":"action➛model","type":"action","ref":"","reference_display":"","base_type":"string","parent_table_name":"","column_name":"","choices":null,"attributes":{}},{"name":"{{action.cooking_request}}","label":"action➛cooking_request","type":"action","ref":"","reference_display":"","base_type":"string","parent_table_name":"","column_name":"","choices":null,"attributes":{}},{"name":"{{step[faabe9db-483e-400e-af2f-e1f093ba9be6].response_body}}","label":"step➛REST step➛Response Body","type":"step","ref":"","reference_display":"","base_type":"string","parent_table_name":"","column_name":"","choices":null,"attributes":{"hidden_for":"DATASTREAM"}}]',
        master_snapshot: '7e94b4c63b9b4b1064e7ecac73e45aeb',
        name: 'Generate External Cooking Plan',
        pre_compiled: 'false',
        state: 'published',
        sys_domain: 'global',
        sys_domain_path: '/',
        system_level: 'false',
        latest_snapshot: '7e94b4c63b9b4b1064e7ecac73e45aeb',
        compiler_build: 'glide-australia-02-11-2026__patch5w40-09-25-2026_09-29-2026_2210.zip',
    },
})
Record({
    $id: Now.ID['bb6cc9fd3b57871064e7ecac73e45a27'],
    table: 'sys_hub_action_status_metadata',
    data: {
        action_type_id: '854ccdbd3b57871064e7ecac73e45a70',
    },
})
Record({
    $id: Now.ID['5794f4c63b9b4b1064e7ecac73e45aa6'],
    table: 'sys_hub_action_status_metadata',
    data: {
        action_type_id: '7e94b4c63b9b4b1064e7ecac73e45aeb',
    },
})
Record({
    $id: Now.ID['9394f4c63b9b4b1064e7ecac73e45ab1'],
    table: 'sys_hub_action_plan',
    data: {
        action_id: '854ccdbd3b57871064e7ecac73e45a70',
        plan: '{"@class":"com.snc.process_flow.engine.serialization.plan_data.ChunkingPlanData","chunk_data":{"table":"sys_hub_action_plan","id":"9394f4c63b9b4b1064e7ecac73e45ab1","name":"plan","plan_signature":null},"plan_data":"CHUNKING_PLAN"}',
        snapshot: '48f29e043b33431064e7ecac73e45ae2',
        sys_domain: 'global',
        sys_domain_path: '/',
    },
})
Record({
    $id: Now.ID['7e94b4c63b9b4b1064e7ecac73e45aeb'],
    table: 'sys_hub_action_type_snapshot',
    data: {
        access: 'public',
        attributes: '{labelCacheCleanUpExecuted=true}',
        authored_on_release_version: '29000',
        callable_by_client_api: 'false',
        internal_name: 'generate_external_cooking_plan',
        label_cache:
            '[{"name":"{{action.model}}","label":"action➛model","type":"action","ref":"","reference_display":"","base_type":"string","parent_table_name":"","column_name":"","choices":null,"attributes":{}},{"name":"{{action.cooking_request}}","label":"action➛cooking_request","type":"action","ref":"","reference_display":"","base_type":"string","parent_table_name":"","column_name":"","choices":null,"attributes":{}},{"name":"{{step[faabe9db-483e-400e-af2f-e1f093ba9be6].response_body}}","label":"step➛REST step➛Response Body","type":"step","ref":"","reference_display":"","base_type":"string","parent_table_name":"","column_name":"","choices":null,"attributes":{"hidden_for":"DATASTREAM"}}]',
        master: 'true',
        name: 'Generate External Cooking Plan',
        parent_action: '854ccdbd3b57871064e7ecac73e45a70',
        sys_domain: 'global',
        sys_domain_path: '/',
        system_level: 'false',
    },
})
