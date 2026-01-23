import SundayDatePicker from "@/app/ui/components/sunday_date_picker";
import PrimaryButton from "@/app/ui/components/primary_button";
import { MenuItem, Select, SelectChangeEvent, ThemeProvider } from "@mui/material";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { MUITheme } from "@/app/utils/util";
import { toast } from "sonner";

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
        <div className="max-w-lg min-w-fit h-14 absolute top-0 right-0 m-4 p-2 z-[500] bg-background rounded-lg flex flex-row gap-2 justify-between items-stretch text-foreground">
            <SundayDatePicker
                date={chosenDate}
                onDateSelected={onDateSelected}
                includeLabel={false}
            />
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
            <PrimaryButton
                disabled={generationInProgress}
                onClick={async () => {
                    onGenerateRoutes();
                }}
            >
                Generate Routes
            </PrimaryButton>
        </div>
    );
}
