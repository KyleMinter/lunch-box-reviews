import './searchBar.css';


interface SearchFilterCriteriaProps {
    name: string;
    group: string;
    selected: boolean;
    selectionType?: 'radio' | 'checkbox';
    inputType?: 'text' | 'date';
    onInteract: (value?: string) => void;
}

const SearchFilterCriteria = (props: SearchFilterCriteriaProps) => {
    const {
        name,
        group,
        selected,
        selectionType = 'radio',
        inputType = 'text',
        onInteract,
    } = props;

    return (
            <div className="search-filter-criteria">
                <input
                    type={selectionType}
                    name={group}
                    checked={selected}
                    onChange={() => onInteract()}
                />
                <div>
                    <label>{name}</label>
                    <input
                        type={inputType}
                        onChange={(e) => {
                            onInteract(e.target.value);
                        }}
                    />
                </div>
            </div>
    )
}

export default SearchFilterCriteria;