class BankController < ApplicationController
  def index
    render :json => current_user.bank.to_json
  end

  def show
    return index
  end

  def update
    if current_user.update_bank(bank_params)
      render :json => current_user.bank.to_json
    else
      render :json => current_user.bank.errors.full_messages, :status => :unprocessable_entity
    end
  end

  private

  def bank_params
    params.require(:bank).permit(:total)
  end
end
