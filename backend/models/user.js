import mongoose from "mongoose";
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    }, 
    isDeleted: {
        type: Boolean,
        default: false
    },
    isOnline: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})



userSchema.pre('save', async function (next) {

    // The `isModified` method returns a boolean indicating whether a particular
    // path has been modified. If the password has not been modified, we can skip
    // the password hashing step. This is useful when we're updating a user's
    // profile information, but not their password.
    if (!this.isModified('password')) {
        next();
    }
    
    this.password = await bcrypt.hashSync(this.password, 10);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return bcrypt.compareSync(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User