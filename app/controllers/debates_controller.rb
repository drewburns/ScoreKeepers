class DebatesController < ApplicationController

	def show
		@debate = Debate.friendly.find(params[:id])
	end

	def create
		puts "_______"
		team_string = debate_params[:teams]
		if team_string.include?(",")
			# Too many teams for now
		else
			team = Team.where('name LIKE ?', "%#{team_string}%")
			# debate_params[:teams] = "TEST"
			# puts debate_params
			@debate = Debate.new(debate_post_params)
			if @debate.save
				puts "DEBATE SAVED"
				puts @debate

				redirect_to @debate, :notice => "Debate Created!"
			else
				puts "DEBATE DIDNT"
				redirect_back fallback_location: root_path , :alert => @debate.errors

			end

		end

	end

	def new
		@debate = Debate.new
	end

	def destroy
	end

	private

  def debate_params
    params.require(:debate).permit(:title, :description, :picture, :picture_cache, :teams)
  end
  def debate_post_params 
  	team_string = debate_params[:teams]
		if team_string.include?(",")
			# Too many teams for now
		else
			team = Team.where('name LIKE ?', "%#{team_string}%").first.id
			return {team_id: team, title: debate_params[:title], description: debate_params[:description], picture: debate_params[:picture]}
		end

  end
end