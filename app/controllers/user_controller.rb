class UserController < ApplicationController
  def index
  end

  def create
    @user = User.new(user_params)
    if @user.save
      redirect_to root_url
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
