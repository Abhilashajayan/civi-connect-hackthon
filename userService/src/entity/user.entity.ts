export class UserEntity {
    public readonly id: string;
    public readonly username: string;
    public readonly email: string;
    public readonly password: string;
    public readonly dob: Date;
    public readonly phone: number;
    public readonly profilePicture: string;
    public readonly gender: string;
    public readonly interest: string[];
    public readonly status: boolean;
    public readonly createdAt: Date;
    public readonly location: string;
    public readonly job: string; 

    constructor(
        id: string,
        username: string,
        email: string,
        password: string,
        dob: Date,
        phone: number,
        profilePicture: string,
        gender: string,
        interest: string[],
        status: boolean,
        createdAt: Date,
        location: string,
        job: string
    ) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.dob = dob;
        this.phone = phone;
        this.profilePicture = profilePicture;
        this.gender = gender;
        this.interest = interest;
        this.status = status;
        this.createdAt = createdAt;
        this.location = location;
        this.job = job;
    }
}
