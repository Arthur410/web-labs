import { IBroker } from "@/interfaces/IBroker";

export class UserService {
  private static instance: UserService | null = null;
  private p_loginedUser: IBroker | null;

  private constructor(user: IBroker) {
    this.p_loginedUser = user;
  }

  public static setInstance(user: IBroker): void {
    UserService.instance = new UserService(user);
    localStorage.setItem('userInstance', JSON.stringify(user));
  }

  public static getCreatedInstance() {
    return UserService.instance;
  }

  public getLoginedUser(): IBroker {
    return <IBroker>this.p_loginedUser
  }

  public static exit() {
    UserService.instance = null;
  }
}
