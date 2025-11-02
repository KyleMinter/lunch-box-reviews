


interface SearchFilterCriteriaProps {
    name: string;
    id: string;
    categoryName: string;
    selected: boolean;
    onSelect: () => void;
    onEdit: (value: string) => void;
}

const SearchFilterCriteria = (props: SearchFilterCriteriaProps) => {
    const {
        name,
        id,
        categoryName,
        selected,
        onSelect,
        onEdit,
    } = props;

    return (
            <div className="search-filter-criteria">
                <input
                    type="radio"
                    name={categoryName}
                    checked={selected}
                    onChange={() => onSelect()}
                />
                <div>
                    <label htmlFor={id}>{name}</label>
                    <input
                        name={id}
                        type="text"
                        onChange={(e) => {
                            onEdit(e.target.value);
                        }}
                    />
                </div>
            </div>
    )
}

export default SearchFilterCriteria;