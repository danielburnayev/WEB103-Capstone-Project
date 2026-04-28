
export default function Button(props) { 
    const text = props.text;
    const id = props.id;
    const disabled = Boolean(props.disabled);

    return (
        <button className={`border p-1 rounded-xl text-sm ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`} 
                id={id}
                disabled={disabled}
                onMouseOver={() => showButtonIsHovered()}
                onMouseOut={() => resetButtonStyle()}
                onClick={props.onClick}>

            {text}

        </button>
    );

    function showButtonIsHovered() {
        if (disabled) return;
        const thisButton = document.getElementById(id);
        if (!thisButton) return;
        thisButton.style.backgroundColor = "black";
        thisButton.style.color = "white";
    }

    function resetButtonStyle() {
        if (disabled) return;
        const thisButton = document.getElementById(id);
        if (!thisButton) return;
        thisButton.style.backgroundColor = "transparent";
        thisButton.style.color = "black";
    }
}