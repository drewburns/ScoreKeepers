class UserTeamsController < ApplicationController
	before_action :authenticate_user!

	def create
		@userTeam = UserTeam.new(user_team_params)
		if @userTeam.save 
			redirect_to :back , :notice => "Favorite Team Added"
		else
			redirect_to :back , :error => "Error"
		end
	end

	def destroy
	end

	private
	  def user_team_params
      params.require(:user_team).permit(:user_id, :team_id )
    end
end


# U6Aw4h4bR5bmuNdPssiByD2F
# curl -d '{"team_id":"2", "post_id":"1"}' -H "Content-Type: application/json" -H "Authorization: Token token=U6Aw4h4bR5bmuNdPssiByD2F" -X POST http://localhost:3000/postTeams