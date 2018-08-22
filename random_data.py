import random
import sys
import time

def clamp(n, smallest, largest): return max(smallest, min(n, largest))

def plot():
	i = 0.0
	theint = 50
	for x in range(20):
		newint = theint + random.randint(-5, 5)
		theint = clamp(newint, 0, 100)
		print (str(i)+","+str(theint))
		i = i + 1
		sys.stdout.flush()
	for x in range(20):
		newint = theint + random.randint(-5, 5)
		theint = clamp(newint, 0, 100)
		print (str(i)+","+str(theint))
		i = i - 1
		sys.stdout.flush()

plot()