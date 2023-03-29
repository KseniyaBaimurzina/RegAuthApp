import api from "./axios";
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { Table, TableRow, TableCell, TableSortLabel, Checkbox, Button } from "@material-ui/core";
import BlockIcon from '@material-ui/icons/Lock';
import LockOpenIcon from '@material-ui/icons/LockOpen';
import DeleteIcon from '@material-ui/icons/Delete';



const Users = () => {
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const navigateTo = useNavigate();

    const getUsers = useCallback(async () => {
        try {
          const res = await api.get("/users");
          setUsers(res.data);
        } catch (error) {
          if(error.response && error.response.status === 401) {
            localStorage.removeItem('temitope');
            navigateTo('/login');
          }
        }
      }, [navigateTo]);

    useEffect(() => {
        getUsers();
        const interval = setInterval(() => {
            getUsers();
        }, 3000);
        return () => clearInterval(interval);
    }, [getUsers]);

    const handleCheckboxChange = (userEmail) => {
        if (selectedUsers.includes(userEmail)) {
            setSelectedUsers(selectedUsers.filter((email) => email !== userEmail));
        } else {
            selectedUsers.push(userEmail)
            setSelectedUsers(selectedUsers);
        }
    };

    const handleSelectAllChange = () => {
        setSelectAll(!selectAll);
        if (!selectAll) {
            setSelectedUsers(users.map((user) => user.email));
        } else {
            setSelectedUsers([]);
        }
    };

    const handleBlockUsers = async () => {
        try {
            api.put("/users/", {data: ["blocked", selectedUsers]})
            .then((res)=>{
                console.log(res)
            })
            .catch((err)=>{
                console.log(err)
            })
            setSelectedUsers([]);
            setSelectAll(false);

            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                selectedUsers.includes(user.id)
                    ? { ...user, status: "blocked" }
                    : user
                )
            );
        } catch (err) {
            if (err.response.status === 401) {
                localStorage.removeItem("temitope");
                navigateTo("/login");
            }
        }
    };

    const handleUnblockUsers = async () => {
        try {
            api.put("/users/", {data: ["active", selectedUsers]})
            .then((res)=>{
                console.log(res)
            })
            .catch((err)=>{
                console.log(err)
            })
            setSelectedUsers([]);
            setSelectAll(false);
            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                selectedUsers.includes(user.email)
                    ? { ...user, status: "active" }
                    : user
                )
            );
        } catch (err) {
            if (err.response.status === 401) {
                localStorage.removeItem("temitope");
                navigateTo("/login");
            }
        }
    };
    const handleDeleteUsers = async () => {
        try {
            api.delete("/users/", {data: selectedUsers})
            .then((res)=>{
                console.log(res)
            })
            .catch((err)=>{
                console.log(err)
            })
            setSelectedUsers([]);
            setSelectAll(false);
            setUsers((prevUsers) =>
                prevUsers.filter((user) => !selectedUsers.includes(user.email))
                );
                const userEmail = JSON.parse(localStorage.getItem("user")).email;
                console.log(userEmail)
                if (selectedUsers.includes(userEmail)) {
                    localStorage.removeItem("temitope");
                    localStorage.removeItem("user");
                    navigateTo("/login");
                }
        } catch (err) {
            if (err.response.status === 401) {
            localStorage.removeItem("temitope");
            navigateTo("/login");
            }
        }
    };

    const handleResetSelection = () => {
        setSelectedUsers([]);
        setSelectAll(false);
    };
    
    const handleDeleteClick = () => {
        handleDeleteUsers();
        handleResetSelection();
    };
      
    const handleBlockClick = () => {
        handleBlockUsers();
        handleResetSelection();
    };
      
    const handleUnblockClick = () => {
        handleUnblockUsers();
        handleResetSelection();
    };

    return (
        <div>
            <div style={{padding: "1em"}}>
                <Button variant="contained" color="primary" onClick={handleBlockClick}>
                    <BlockIcon />
                </Button>{" "}
                <Button variant="contained" color="primary" onClick={handleUnblockClick}>
                <LockOpenIcon/>
                </Button>{" "}
                <Button variant="contained" color="primary" onClick={handleDeleteClick}>
                <DeleteIcon/>
                </Button>
            </div>
            <Table>
                <TableRow>
                <TableCell>
                <TableSortLabel
                    onClick={handleSelectAllChange}
                    active={selectAll}
                    direction="desc"
                >
                    Select/Remove All
                </TableSortLabel>
                </TableCell>
                <TableCell>
                    <b>ID</b>
                </TableCell>
                <TableCell>
                    <b>Username</b>
                </TableCell>
                <TableCell>
                    <b>Email</b>
                </TableCell>
                <TableCell>
                    <b>Sign Up</b>
                </TableCell>
                <TableCell>
                    <b>Last seen</b>
                </TableCell>
                <TableCell>
                    <b>Status</b>
                </TableCell>
                </TableRow>
                {users.map((user) => (
                <TableRow key={user.email}>
                    <TableCell>
                    <Checkbox checked={selectedUsers.includes(user.email)} onChange={() => handleCheckboxChange(user.email)} />
                    </TableCell>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.reg_date.substring(0, 10)}</TableCell>
                    <TableCell>{user.last_login_date.substring(0, 10)}</TableCell>
                    <TableCell>{user.status}</TableCell>
                </TableRow>
                ))}
            </Table>
        </div>
    );

}

export default Users;