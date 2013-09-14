class UserController < ApplicationController
  include ApplicationHelper
  
  def index
    if current_user
      # check if they have no budget
      @no_bujit = current_user.bujit.amount_is_not_set?
      if @no_bujit
        flash.now[:no_bujit] = "You need to set a daily bujit!"
      else
        flash.now[:spent_money] = "Did you spend money today?"
      end

    end
  end

  def new
    @user = User.new
  end

  def create
    @user = User.new(user_params)
    if @user.save
      render :success
    else
      render_failure
    end
  end

  def edit
  end

  def show
  end

  def update
  end

  def destroy
  end

  private

  def user_params
    params.require(:user).permit(:email, :password)
  end
end
