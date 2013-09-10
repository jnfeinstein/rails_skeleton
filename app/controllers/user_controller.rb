class UserController < ApplicationController
  include ApplicationHelper
  
  def index
    if current_user
      # check if they have no budget
      flash.now[:budget_is_not_set] = "Your bujit is $0? Set a bujit!" if current_user.bujit.amount_is_not_set?
    end
  end

  def new
    @user = User.new
  end

  def create
    @user = User.new(user_params)
    @user.password = params[:password]
    if @user.save
      do_authentication(@user)
    else
      render 'new'
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
    params.require(:user).permit(:email)
  end
end
