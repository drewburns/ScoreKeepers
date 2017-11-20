# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)
require 'faker'
sports = ["basketball","football","soccer","hockey","baseball"]
Team.destroy_all
File.readlines('teams/basketball.txt').each do |line|
	line_split = line.split(",")
	Team.create(name: line_split[0].strip, coach: line_split[1].strip, frontoffice: line_split[2].strip, stadium: line_split[3].strip, picture_url: line_split[4].strip, sport_string: "basketball")
end
File.readlines('teams/hockey.txt').each do |line|
	line_split = line.split(",")
	Team.create(name: line_split[0].strip, coach: line_split[1].strip, frontoffice: line_split[2].strip, stadium: line_split[3].strip ,picture_url: line_split[4].strip,  sport_string: "hockey")
end
File.readlines('teams/football.txt').each do |line|
	line_split = line.split(",")
	Team.create(name: line_split[0].strip, coach: line_split[1].strip, frontoffice: line_split[2].strip, stadium: line_split[3].strip, picture_url: line_split[4].strip, sport_string: "football")
end
File.readlines('teams/baseball.txt').each do |line|
	line_split = line.split(",")
	Team.create(name: line_split[0].strip, coach: line_split[1].strip, frontoffice: line_split[2].strip, stadium: line_split[3].strip, picture_url: line_split[4].strip, sport_string: "baseball")
	
end
# 10.times do
# 	user = User.create(name: Faker::Name.name, email: Faker::Internet.email, password: "test12345", bio: Faker::MostInterestingManInTheWorld.quote)
# 	team_int = Random.rand(6)
# 	team_int.times do
# 		UserTeam.create(user_id: user.id, team_id: Team.offset(rand(Team.count)).first.id)
# 	end

# 	rand_int = Random.rand(8)
# 	rand_int.times do
# 		new_rand_int = Random.rand(5)
# 		post = Post.create(user_id: user.id, title: Faker::Lorem.sentence(3), content: Faker::Lorem.paragraph(7), thumbnail_url: nil, sport: sports[new_rand_int], status: "approved")
# 		post_rant_int = Random.rand(2)
# 		post_rant_int.times do
# 			team = Team.offset(rand(Team.count)).first
# 			PostTeam.create(post_id: post.id, team_id: team.id)
# 		end
# 	end
# end

# Post.all.each do |post|
# 	User.all.each do |user|
# 		rand = Random.rand(3)
# 		if rand == 1 or rand == 2
# 			value = 1
# 		else
# 			value = -1
# 		end
# 		post.add_or_update_evaluation(:votes, value, user)
# 		comment = Comment.create(user_id: user.id, post_id: post.id, text: Faker::Simpsons.quote )
# 	end
# end

# Comment.all.each do |comment|
# 	User.all.each do |user|
# 		rand2 = Random.rand(3)
# 		if rand2 == 1 or rand2 == 2
# 			value2 = 1
# 		else
# 			value2 = -1
# 		end
# 		comment.add_or_update_evaluation(:votes, value2, user)
# 	end
# end




