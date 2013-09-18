class UserController < ApplicationController
  skip_before_filter :check_token, :only => ['create']

  def create
    user = User.new(user_params)
    if user.save
      render :json => [user.make_token]
    else
      render :json => user.errors.full_messages, :status => :unprocessable_entity
    end
  end

  def index
    render :json => {:bank => current_user.bank, :bujit => current_user.bujit}
  end

  def show
    index
  end

  private

  def user_params
    params.require('user').permit(:email, :password)
  end
end
