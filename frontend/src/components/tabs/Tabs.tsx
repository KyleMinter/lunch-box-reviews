import './tabs.css';


interface TabsProps {
    options: TabOption[]
    onOptionSelect: (option: TabOption) => void,
    children: React.ReactNode;
}

export interface TabOption {
    name: string;
    key: string;
    selected: boolean;
}

const Tabs: React.FC<TabsProps> = ({
    options,
    onOptionSelect,
    children
}) => {
    return (
        <>
            <div className="tabs-header">
                {options.map((option) => { return (
                    <div
                        onClick={() => onOptionSelect(option)}
                        className={option.selected ? 'selected-option' : undefined}
                        key={option.key}
                    >{option.name}</div>
                )})}
            </div>
            <div className="tabs-content">
                {children}
            </div>
        </>
    )
}

export default Tabs;