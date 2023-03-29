import { useLocation,Navigate } from "react-router-dom";

export const setToken = (token)=>{

    localStorage.setItem('temitope', token);
}

export const fetchToken = (token)=>{

    return localStorage.getItem('temitope');
}

export function RequireToken({children}){

    let auth = fetchToken();
    let location = useLocation();
    console.log("Check Auth");

    if(!auth){
        console.log("Unauthorized");
        return <Navigate to='/login' state ={{from : location}}/>;
    }

    return children;
}
