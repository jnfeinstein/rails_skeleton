class BujitController < ApplicationController
  def index
    render :json => current_user.bujit.to_json
  end

  def update
    if current_user.update_bujit(bujit_params)
      render :json => current_user.bujit.to_json
    else
      render :json => current_user.bujit.errors.full_messages, :status => :unprocessable_entity
    end
  end

  private

  def bujit_params
    params.require(:bujit).permit(:amount)
  end
end
