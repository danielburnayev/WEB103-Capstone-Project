
export default function Button(props) { 
    const text = props.text;
    const id = props.id;
    const disabled = Boolean(props.disabled);
    const className = props.className ?? "";

    return (
        <button className={`border border-gray-300 bg-white text-gray-800 px-3 py-1.5 rounded-xl text-sm font-medium transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 ${className}`} 
                id={id}
                disabled={disabled}
                onClick={disabled ? undefined : props.onClick}>

            {text}

        </button>
    );
}