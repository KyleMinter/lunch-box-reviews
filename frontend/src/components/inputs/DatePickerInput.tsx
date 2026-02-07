import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { PickerValue } from '@mui/x-date-pickers/internals';
import { DateValidationError, PickerChangeHandlerContext } from '@mui/x-date-pickers';

interface DatePickerInputProps {
  label?: string;
  disabled?: boolean;
  value: PickerValue
  onChange?: (value: PickerValue, context: PickerChangeHandlerContext<DateValidationError>) => void;
}

const DatePickerInput = (props: DatePickerInputProps) => {
  const {
    label,
    disabled = false,
    value,
    onChange
  } = props;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label={label}
        disabled={disabled}
        value={value}
        onChange={onChange}
      />
    </LocalizationProvider>
  );
}

export default DatePickerInput;