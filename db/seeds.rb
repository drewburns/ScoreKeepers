# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)
require 'faker'
sports = ["basketball","football","soccer","hockey","baseball"]
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
10.times do
	user = User.create(name: Faker::Name.name, email: Faker::Internet.email, password: "test12345", bio: Faker::MostInterestingManInTheWorld.quote)
	team_int = Random.rand(5)
	team_int.times do
		UserTeam.create(user_id: user.id, team_id: Team.offset(rand(Team.count)).first.id)
	end

	rand_int = Random.rand(5)
	rand_int.times do
		new_rand_int = Random.rand(3)
		post = Post.create(user_id: user.id, title: Faker::Lorem.sentence(3), content: Faker::Lorem.paragraph(7), thumbnail_url: nil, sport: sports[new_rand_int], status: "approved")
		post_rant_int = Random.rand(2)
		post_rant_int.times do
			team = Team.offset(rand(Team.count)).first
			p team
			PostTeam.create(post_id: post.id, team_id: team.id)
		end
	end
end

Post.all.each do |post|
	User.all.each do |user|
		rand = Random.rand(3)
		if rand == 1 or rand == 2
			value = 1
		else
			value = -1
		end
		post.add_or_update_evaluation(:votes, value, user)
		comment = Comment.create(user_id: user.id, target_type: "Post", target_id: post.id, text: Faker::Simpsons.quote )
	end
end

Comment.all.each do |comment|
	User.all.each do |user|
		rand2 = Random.rand(3)
		if rand2 == 1 or rand2 == 2
			value2 = 1
		else
			value2 = -1
		end
		comment.add_or_update_evaluation(:votes, value2, user)
	end
end

Team.all.each do |team|
	Debate.create(team_id: team.id, title: team.coach, description: "What is your opinion?", about: "coach")
	Debate.create(team_id: team.id, title: team.name + " Front Office", description: "What is your opinion?", about: "fo")
	Debate.create(team_id: team.id, title: team.name, description: "What is your opinion?", about: "team")
	Debate.create(team_id: team.id, title: team.stadium, description: "What is your opinion?", about: "stadium")
end

3.times do
	Debate.create(team_id: Team.order("RANDOM()").limit(1).first.id, title: Faker::Simpsons.quote, description: Faker::Simpsons.quote)
end

Team.all.each do |team|
	string = team.picture_url.gsub(/\d{3}x\d{3}/,"64x64")
	team.update(thumbnail_url: string)
end
# User.find_each(&:save)
# Team.find_each(&:save)
# Post.find_each(&:save)




