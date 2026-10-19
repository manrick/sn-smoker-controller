import { Record } from '@servicenow/sdk/core'

Record({
    $id: Now.ID['b2f6fffb3b9b071064e7ecac73e45abc'],
    table: 'sys_hub_step_ext_output',
    data: {
        active: 'true',
        array: 'false',
        attributes:
            'element_mapping_provider=com.glide.flow_design.action.data.FlowDesignVariableMapper,isLocal=true,uiType=password2,uiTypeLabel=Password (2 Way Encrypted),uiUniqueId=c075b6a6-3708-4d5c-a466-b444b1a8d61c',
        audit: 'false',
        calculation: `(function calculatedFieldValue(current) {

	// Add your code here
	return '';  // return the calculated value

})(current);`,
        display: 'false',
        dynamic_creation: 'false',
        element: 'sn_auth_token',
        element_reference: 'false',
        function_field: 'false',
        internal_type: 'password2',
        label: 'Credential Value',
        mandatory: 'false',
        max_length: '255',
        model: '7af6fffb3b9b071064e7ecac73e45a79',
        model_id: '7af6fffb3b9b071064e7ecac73e45a79',
        model_table: 'sys_hub_step_instance',
        name: 'var__m_sys_hub_step_ext_output_7af6fffb3b9b071064e7ecac73e45a79',
        order: '1',
        primary: 'false',
        read_only: 'false',
        reference_floats: 'false',
        spell_check: 'false',
        staged: 'false',
        table_reference: 'false',
        text_index: 'false',
        unique: 'false',
        use_dependent_field: 'false',
        use_dynamic_default: 'false',
        use_reference_qualifier: 'simple',
        virtual: 'false',
        virtual_type: 'script',
        xml_view: 'false',
    },
})
