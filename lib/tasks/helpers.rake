namespace :helpers do
  desc "TODO"
  task image_to_cloud: :environment do
  	Team.all.each do |team|
  		team.remote_picture_url = team.attributes["picture_url"]
  		team.save!
  	end
  end

end
