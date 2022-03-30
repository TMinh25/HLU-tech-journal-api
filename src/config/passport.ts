import passport from 'passport';
import passportJwt from 'passport-jwt';
import User from '../models/user.model';
import config from './config';

let JwtStrategy = passportJwt.Strategy;
let ExtractJwt = passportJwt.ExtractJwt;

export = () => {
	let options = {
		secretOrKey: config.jwtKey,
		jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('jwt')
	};

	passport.use(
		new JwtStrategy(options, (payload, done) => {
			User.find(
				{
					_id: payload._id
				},
				(err, user) => {
					if (err) return done(err, false);
					if (user) return done(null, user);
					else return done(null, false);
				}
			);
		})
	);
};
