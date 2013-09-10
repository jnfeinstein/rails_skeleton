class BankController < ApplicationController
  def new
  end

  def create
  end

  def edit
    @bank = current_user.bank
  end

  def update
    @bank = current_user.build_bank(bank_params)
    if @bank.save
      redirect_to root_url
    else
      render 'edit'
    end
  end

  def destroy
  end

  private

  def bank_params
    params.require(:bank).permit(:total)
  end
end
