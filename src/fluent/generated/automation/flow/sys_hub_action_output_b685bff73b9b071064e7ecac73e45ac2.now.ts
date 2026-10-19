import { Record } from '@servicenow/sdk/core'

Record({
    $id: Now.ID['b685bff73b9b071064e7ecac73e45ac2'],
    table: 'sys_hub_action_output',
    data: {
        active: 'true',
        array: 'false',
        attributes:
            'element_mapping_provider=com.glide.flow_design.action.data.FlowDesignVariableMapper,pwd2droppable=true,uiType=string,uiTypeLabel=String,uiUniqueId=ebdd76ee-0959-4634-89a4-bd9a5a9bb267',
        audit: 'false',
        calculation: `(function calculatedFieldValue(current) {

	// Add your code here
	return '';  // return the calculated value

})(current);`,
        display: 'false',
        dynamic_creation: 'false',
        element: 'response',
        element_prototype: 'a804c77347622200b4fad7527c9a7119',
        element_reference: 'false',
        function_field: 'false',
        internal_type: 'string',
        label: 'response',
        mandatory: 'false',
        max_length: '8000',
        model: 'da857ff73b9b071064e7ecac73e45ae6',
        model_id: 'da857ff73b9b071064e7ecac73e45ae6',
        model_table: 'sys_hub_action_type_snapshot',
        name: 'var__m_sys_hub_action_output_da857ff73b9b071064e7ecac73e45ae6',
        order: '2',
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
