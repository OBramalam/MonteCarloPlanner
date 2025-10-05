
# Asset utilities
def get_asset_type_display(asset_type):
    """
    Get human-readable asset type display
    """
    asset_type_displays = {
        'cash': 'Cash',
        'stocks': 'Stocks',
        'bonds': 'Bonds',
        'real_estate': 'Real Estate',
        'other': 'Other'
    }
    return asset_type_displays.get(asset_type, asset_type)


def get_asset_category(asset_type):
    """
    Get asset category for grouping
    """
    categories = {
        'cash': 'Liquid Assets',
        'stocks': 'Investments',
        'bonds': 'Investments',
        'real_estate': 'Property',
        'other': 'Other Assets'
    }
    return categories.get(asset_type, 'Other Assets')


# Income/Expense utilities
def calculate_annual_amount(amount, frequency):
    """
    Calculate annual amount based on frequency
    """
    frequency_multipliers = {
        'monthly': 12,
        'annual': 1,
        'one_time': 0
    }
    return float(amount) * frequency_multipliers.get(frequency, 1)


def get_frequency_display(frequency):
    """
    Get human-readable frequency display
    """
    frequency_displays = {
        'monthly': 'Monthly',
        'annual': 'Annual',
        'one_time': 'One Time'
    }
    return frequency_displays.get(frequency, frequency)


# Liability utilities
def get_liability_type_display(liability_type):
    """
    Get human-readable liability type display
    """
    liability_type_displays = {
        'mortgage': 'Mortgage',
        'credit_card': 'Credit Card',
        'student_loan': 'Student Loan',
        'car_loan': 'Car Loan',
        'other': 'Other'
    }
    return liability_type_displays.get(liability_type, liability_type)


def calculate_total_interest(balance, monthly_payment, interest_rate, liability_type):
    """
    Calculate estimated total interest (simplified calculation)
    """
    if interest_rate == 0:
        return 0
    
    # Simple calculation: assume 30-year term for mortgage, 5-year for others
    if liability_type == 'mortgage':
        years = 30
    else:
        years = 5
    
    total_payments = float(monthly_payment) * 12 * years
    total_interest = total_payments - float(balance)
    return max(0, total_interest)


# Financial Event utilities
def get_event_type_display(event_type):
    """
    Get human-readable event type display
    """
    event_type_displays = {
        'house_purchase': 'House Purchase',
        'inheritance': 'Inheritance',
        'college_tuition': 'College Tuition',
        'wedding': 'Wedding',
        'other': 'Other'
    }
    return event_type_displays.get(event_type, event_type)


def get_event_category(event_type):
    """
    Get event category for grouping
    """
    categories = {
        'house_purchase': 'Major Purchase',
        'inheritance': 'Windfall',
        'college_tuition': 'Education',
        'wedding': 'Life Event',
        'other': 'Other'
    }
    return categories.get(event_type, 'Other')


def get_impact_description(event_type, amount):
    """
    Get impact description based on event type and amount
    """
    if amount > 0:
        if event_type == 'inheritance':
            return f"Positive impact: +${amount:,.2f} windfall"
        elif event_type == 'house_purchase':
            return f"Major expense: -${abs(amount):,.2f} for home purchase"
        elif event_type == 'college_tuition':
            return f"Education expense: -${abs(amount):,.2f} for tuition"
        else:
            return f"Financial impact: ${amount:,.2f}"
    else:
        return f"Expense: -${abs(amount):,.2f}"


# User Profile utilities
def get_risk_tolerance_display(risk_tolerance):
    """
    Get human-readable risk tolerance display
    """
    risk_display = {
        'conservative': 'Conservative (Low Risk)',
        'moderate': 'Moderate (Medium Risk)',
        'aggressive': 'Aggressive (High Risk)'
    }
    return risk_display.get(risk_tolerance, risk_tolerance)


# Formatting utilities
def format_currency(amount):
    """
    Format amount as currency
    """
    return f"${amount:,.2f}"


def format_percentage(rate):
    """
    Format rate as percentage
    """
    return f"{rate}%"