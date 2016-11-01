
export var userActions = {
    LOGIN: "[User] Login",
    LOGIN_SUCCESS: "[User] Login Success",
};

export class UserLogin extends CustomEvent {
    constructor(username: string, password:string) {
        super(userActions.LOGIN, {
            detail: { username, password }
        });
    }
}

export class UserLoginSuccess extends CustomEvent {
    constructor(token: any) {
        super(userActions.LOGIN_SUCCESS, {
            detail: { token }
        });
    }
}