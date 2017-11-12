# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)
require 'faker'
sports = %w[basketball football soccer hockey baseball]
20.times do
  Team.create(name: Faker::Team.name)
end
10.times do
  user = User.create(username: Faker::Twitter.screen_name, email: Faker::Internet.email, password: 'test12345')
  team_int = Random.rand(6)
  team_int.times do
    UserTeam.create(user_id: user.id, team_id: Team.offset(rand(Team.count)).first.id)
  end

  rand_int = Random.rand(8)
  rand_int.times do
    new_rand_int = Random.rand(5)
    post = Post.create(user_id: user.id, title: Faker::Lorem.sentence(3), content: Faker::Lorem.paragraph(7), thumbnail_url: nil, sport: sports[new_rand_int], status: 'approved')
    post_rant_int = Random.rand(2)
    post_rant_int.times do
      team = Team.offset(rand(Team.count)).first
      PostTeam.create(post_id: post.id, team_id: team.id)
    end
  end
end

Post.all.each do |post|
  User.all.each do |user|
    rand = Random.rand(3)
    value = if (rand == 1) || (rand == 2)
              1
            else
              -1
            end
    post.add_or_update_evaluation(:votes, value, user)
    comment = Comment.create(user_id: user.id, post_id: post.id, text: Faker::Simpsons.quote)
  end
end

Comment.all.each do |comment|
  User.all.each do |user|
    rand2 = Random.rand(3)
    value2 = if (rand2 == 1) || (rand2 == 2)
               1
             else
               -1
             end
    comment.add_or_update_evaluation(:votes, value2, user)
  end
end
