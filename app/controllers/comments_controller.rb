class CommentsController < ApplicationController
	before_action :authenticate_user! 
	def create
		@comment = Comment.new(comment_params)
		p "______________"
		p @comment
	    if @comment.save
	    	redirect_back fallback_location: root_path, :notice => "Comment Created!"
	    else
	    	p @comment.errors
	    	redirect_back fallback_location: root_path , :alert => "Please retry"
	    end
	end

	def destroy
	end

  def vote
    if params[:user_id] 
      @value = params[:type] == 'up' ? 1 : -1
      add_value = @value == 1 ? 1 : -1
      puts "ADD VALUE " + add_value.to_s
      @comment = Comment.find(params[:id])
      @user = User.find(params[:user_id])
      @new_score = params[:old_score].to_i + add_value

      if @user && @comment
        @comment.add_or_update_evaluation(:votes, @value, @user)
        render :file => "comments/vote.js.erb"
        # redirect_back fallback_location: root_path, notice: 'Vote counted'
      else
        render :file => "shared/error.js.erb"
        # redirect_back fallback_location: root_path, alert: 'Error'
      end
    else
      render :file => "shared/error.js.erb"
    end
  end

  private

    def comment_params
      params.require(:comment).permit(:user_id, :target_type, :text, :target_id )
    end

end