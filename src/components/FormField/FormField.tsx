import React from 'react';
import Input from '../Input';

interface FormFieldProps extends React.ComponentProps<typeof Input> {
  name: string;
}

const FormField: React.FC<FormFieldProps> = (props) => {
  return <Input {...props} />;
};

export default FormField;