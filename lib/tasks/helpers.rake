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

end
