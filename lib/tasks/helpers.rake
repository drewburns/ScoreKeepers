namespace :helpers do
  desc "TODO"
  task image_to_cloud: :environment do
  	Team.all.each do |team|
  		team.remote_picture_url = team.attributes["picture_url"]
  		team.save!
  	end
  end

  task image_urls: :environment do
  	array = []
  	image_urls = []
  	thumbnail_urls = []
  	File.readlines('team_urls.txt').each do |line|
  		array << line
  	end

  	array.each {|x| array.index(x).even? ? image_urls << x : thumbnail_urls << x}

  	puts thumbnail_urls.count
  	puts image_urls.count
    teams = Team.all.sort_by{|t| t.id}.to_a
  	(0..(image_urls.count-1)).to_a.each do |num|
  		team = teams[num]
      puts "___________________"
      puts image_urls[num]
  		team.picture_url = image_urls[num]
  		team.thumbnail_url = thumbnail_urls[num]
  		team.save!
  	end
  end
  task create_team_debates: :environment do 
    Team.all.each do |team|
      Debate.create(team_id: team.id, title: team.coach, description: "What is your opinion?", about: "coach")
      Debate.create(team_id: team.id, title: team.name + " Front Office", description: "What is your opinion?", about: "fo")
      Debate.create(team_id: team.id, title: team.name, description: "What is your opinion?", about: "team")
      Debate.create(team_id: team.id, title: team.stadium, description: "What is your opinion?", about: "stadium")
    end
  end

  task update_coaches: :environment do 
    sports = ["basketball","football","hockey","baseball"]
    sports.each do |sport|
      File.readlines("teams/#{sport}_coach.txt").each do |line|
        split = line.split(",")
        team_name = split[0].strip
        coach_name = split[1].strip
        team = Team.where(name: team_name).first
        old_coach = team.coach

        if old_coach != coach_name and coach_name != "Vacant"
          Debate.create(title: coach_name, description: "What is your opinion?", about: "coach", team_id: team.id)
        end
        team.coach = coach_name
        team.save
      end
    end
  end

end
