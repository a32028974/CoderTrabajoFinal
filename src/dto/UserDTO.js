export default class UserDTO {
  constructor(user) {
    this.id = user.id || user._id;
    this.email = user.email;
    this.role = user.role;
    this.createdAt = user.createdAt;
  }
}
