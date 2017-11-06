class PostTeamsController < ApplicationController
	# wrap_parameters :post_team, include: [:post_id, :team_id ]
	# before_action :require_login 
	before_action :authenticate_user!

	def create
		@postTeam = PostTeam.new(post_team_params)
		if @postTeam.save 
			redirect_to :back , :notice => "Team added to post"
		else
			redirect_to :back , :error => "Error"
		end
				
	end

	def destroy
	end

	private
	  def post_team_params
      params.require(:post_team).permit(:post_id, :team_id )
    end
end
