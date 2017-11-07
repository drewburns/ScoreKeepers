class UserTeamsController < ApplicationController
	before_action :authenticate_user!

	def create
		@userTeam = UserTeam.new(user_team_params)
		if @userTeam.save 
			redirect_back fallback_location: root_path, :notice => "Team added"
		else
			redirect_back fallback_location: root_path, :alert => "Error"
		end
	end

	def destroy
		@userTeam = UserTeam.find(params[:id])
		if @userTeam.destroy
			redirect_back fallback_location: root_path, :notice => "Team Removed"
		else
			redirect_back fallback_location: root_path, :alert => "Error"
		end
	end

	private
	  def user_team_params
      params.permit(:user_id, :team_id, :id)
    end
end


# U6Aw4h4bR5bmuNdPssiByD2F
# curl -d '{"team_id":"2", "post_id":"1"}' -H "Content-Type: application/json" -H "Authorization: Token token=U6Aw4h4bR5bmuNdPssiByD2F" -X POST http://localhost:3000/postTeams