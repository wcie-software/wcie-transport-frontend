import SundayDatePicker from "@/app/ui/components/sunday_date_picker";
import PrimaryButton from "@/app/ui/components/primary_button";
import {
  MenuItem,
  Select,
  SelectChangeEvent,
  ThemeProvider,
} from "@mui/material";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { MUITheme } from "@/app/utils/util";

interface AssignmentsControlPanelProps {
  chosenDate: Date;
  onDateSelected: (date: Date) => void;
  serviceNumber: string;
  onServiceNumberChange: (value: string) => void;
  generationInProgress: boolean;
  onGenerateRoutes: () => void;
}

export default function AssignmentsControlPanel({
  chosenDate,
  onDateSelected,
  serviceNumber,
  onServiceNumberChange,
  generationInProgress,
  onGenerateRoutes,
}: AssignmentsControlPanelProps) {
  return (
    // Shown at the top-right on top of everything
    <div className="absolute z-600 top-0 right-0 mx-4 my-2 max-w-lg min-w-fit bg-background rounded-lg md:h-14 p-2 flex flex-col md:flex-row gap-2 justify-between items-stretch text-foreground">
      <SundayDatePicker
        date={chosenDate}
        onDateSelected={onDateSelected}
        includeLabel={false}
      />
      {/* Select service */}
      <ThemeProvider theme={MUITheme}>
        <Select
          className="flex-1 border-gray-200 dark:border-gray-600 rounded p-0 pe-2 outline-0"
          size="small"
          value={serviceNumber}
          IconComponent={() => <ChevronDownIcon width={20} height={20} />}
          onChange={(e: SelectChangeEvent) => {
            onServiceNumberChange(e.target.value);
          }}
        >
          <MenuItem value={1}>1st Service</MenuItem>
          <MenuItem value={2}>2nd Service</MenuItem>
        </Select>
      </ThemeProvider>
      <PrimaryButton disabled={generationInProgress} onClick={onGenerateRoutes}>
        Generate Routes
      </PrimaryButton>
    </div>
  );
}
