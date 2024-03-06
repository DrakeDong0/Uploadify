import React from "react";
import videox from "../assets/videoBG.mp4"

function BG_Video(){
    return(
        <div>
            <video loop autoPlay muted id='bg-video'>
                <source src={videox} type="video/mp4" />
            </video>
        </div>
    );
}

export default BG_Video