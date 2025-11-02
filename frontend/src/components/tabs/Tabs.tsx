import { ReactElement, useState } from 'react';
import './tabs.css';
import React from 'react';


export interface TabProps {
    id: string;
    header: string;
    children: React.ReactNode;
}

export const Tab: React.FC<TabProps> = ({ children }) => {
    return (<>{children}</>);
}

interface TabsProps {
    defaultSelected: string;
    onTabSelect: (id: string) => void;
    children: React.ReactElement<TabProps>[];
}

const Tabs: React.FC<TabsProps> = ({
    defaultSelected,
    onTabSelect,
    children
}) => {
    const tabs = React.Children.toArray(children) as ReactElement<TabProps>[];

    if (tabs.find((tab) => tab.props.id === defaultSelected) === undefined)
        defaultSelected = tabs[0].props.id;

    const [selectedTabId, setSelectedTabId] = useState<string>(defaultSelected);
    const selectedTab = tabs.find((tab) => tab.props.id === selectedTabId);

    const onSelect = (id: string) => {
        setSelectedTabId(id);
        onTabSelect(id);
    }

    return (
        <>
            <div className="tabs-header">
                {tabs.map((child) => {
                    const tab = child.props;
                    return (
                        <div
                            onClick={() => onSelect(tab.id)}
                            className={selectedTabId === tab.id ? 'selected-tab' : undefined}
                            key={tab.id}
                        >
                            {tab.header}
                        </div>
                    )
                })}
            </div>
            <div className="tabs-content">
                {selectedTab}
            </div>
        </>
    )
}

export default Tabs;