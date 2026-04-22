
export default function Button(props) { 
    const text = props.text;
    const id = props.id;
    const style = props.style;

    return (
        <button className="border p-1 rounded-xl cursor-pointer text-sm"
                style={style} 
                id={id}
                onMouseOver={() => showButtonIsHovered()}
                onMouseOut={() => resetButtonStyle()}
                onClick={props.onClick}>

            {text}

        </button>
    );

    function showButtonIsHovered() {
        const thisButton = document.getElementById(id);
        thisButton.style.backgroundColor = "black";
        thisButton.style.color = "white";
    }

    function resetButtonStyle() {
        const thisButton = document.getElementById(id);
        thisButton.style.backgroundColor = "transparent";
        thisButton.style.color = "black";
    }
}