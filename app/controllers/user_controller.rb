class UserController < ApplicationController
  include ApplicationHelper
  
  def index
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

  def new
    @user = User.new if @user.nil?
  end

  def edit
  end

  def show
  end

  def update
    render :success
  end

  def destroy
  end

  private

  def user_params
    params.require(:user).permit(:email)
  end

end
