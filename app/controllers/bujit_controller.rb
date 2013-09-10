class BujitController < ApplicationController
  def new
  end

  def create
  end

  def edit
    @bujit = current_user.bujit
  end

  def update
    @bujit = current_user.build_bujit(bujit_params)
    if @bujit.save
      redirect_to root_url
    else
      render 'edit'
    end
  end

  def destroy
  end

  private

  def bujit_params
    params.require(:bujit).permit(:amount)
  end
end
