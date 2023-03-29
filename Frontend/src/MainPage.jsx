import { useNavigate } from "react-router";
import Users from "./Users";
import { Button } from "@material-ui/core";

export default function MainPage(){
    const navigate = useNavigate();
    const signOut = ()=> {
        localStorage.removeItem('temitope')
        navigate('/login')
      
    };

    return(
        <div>
            <div style={{float: 'right', padding: '1em'}}>
                <Button variant="contained" color="secondary" onClick={signOut}>Sign Out</Button>
            </div>
            <div>
                <div>
                <Users />
                </div>
            </div>
        </div>
    )
}
