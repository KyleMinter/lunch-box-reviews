import { useNavigate } from "react-router-dom";


interface SearchResultProps {
    content: string;
}

const SearchResult: React.FC<SearchResultProps> = ({ content }) => {
    const navigate = useNavigate();

    const onRowClick = () => {
        navigate(`/home?row=${content}`);
    };

    return (
        <div className="search-results-row" onClick={onRowClick}>
            <p>{content}</p>
        </div>
    );
}

export default SearchResult;