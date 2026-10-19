import { Alias, AliasTemplate } from '@servicenow/sdk/core'

const smokerExternalLlmAliasTemplate = AliasTemplate({
    $id: Now.ID['smoker-external-llm-alias-template'],
    name: 'Smoker External LLM Connection',
    dynamicDataSchema: {
        connectionFields: [
            { name: 'connectionUrl', label: 'Provider URL', type: 'text', mandatory: true },
        ],
        credentialFields: [
            { name: 'api_key', label: 'API key', type: 'password', mandatory: true },
            { name: 'api_key_header_name', label: 'API key header', type: 'text', mandatory: true, defaultValue: 'Authorization' },
            { name: 'api_key_prefix', label: 'API key prefix', type: 'text', defaultValue: 'Bearer' },
        ],
    },
    defaultDataTemplate: {
        connection: {
            table: 'http_connection',
            name: 'Smoker External LLM Connection',
        },
        credential: {
            table: 'api_key_credentials',
            name: 'Smoker External LLM API Key',
            api_key_header_name: 'Authorization',
            api_key_prefix: 'Bearer',
        },
    },
})

Alias({
    $id: Now.ID['af7801b13b57871064e7ecac73e45a2c'],
    name: 'Smoker Connection Alias',
    type: 'connection',
    connectionType: 'httpConnection',
    configurationTemplate: smokerExternalLlmAliasTemplate,
})
